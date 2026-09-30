import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductResponse, ProductRequest, ImportResult, ImportRow, ImportAction } from '../../../core/models/product.model';

// La vista filtra en el navegador, así que necesita el catálogo completo (hoy ~543 productos).
// Si el catálogo supera este tope habrá que pasar a paginación/búsqueda en el backend.
const MAX_PRODUCTS = 1000;

const DEFAULT_CATEGORIES = [
  'pH / ORP', 'Colorímetro', 'Multiparámetro', 'Conductividad',
  'Videovigilancia', 'Sensores', 'Automatización', 'Materiales eléctricos',
  'Servicios', 'EPP',
];

// Opción de filtro para productos con marca/categoría vacía
const NO_BRAND = '(Sin marca)';
const NO_CATEGORY = '(Sin categoría)';

/** Valor de filtro: el texto limpio, o la etiqueta "sin valor" si está vacío. */
function filterKey(value: string | null | undefined, empty: string): string {
  return value?.trim() || empty;
}

/** Valores distintos ordenados, con la opción "sin valor" al inicio si existe. */
function filterOptions(values: string[], empty: string): string[] {
  const named = Array.from(new Set(values.filter(v => v !== empty)))
    .sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  return values.includes(empty) ? [empty, ...named] : named;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  /* Sidebar filters */
  brands: string[] = [];
  cats: string[] = [];
  selectedBrands: string[] = [];
  selectedCats: string[] = [];
  maxPrice = 6000;
  priceMax = 6000;
  onlyStock = false;
  searchText = '';

  /* Products */
  allProducts: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  loading = false;

  /* Low stock badge */
  lowStockCount = 0;

  /* Product detail modal (edit) */
  showDetail = false;
  selectedProduct?: ProductResponse;
  editMode = false;
  descExpanded = false;
  editForm: Partial<ProductResponse> = {};
  saving = false;

  /* Create product modal */
  showCreate = false;
  creating = false;
  createForm: Partial<ProductRequest> = {};
  createCategories: string[] = DEFAULT_CATEGORIES;

  /* Bulk upload modal (POST /api/inventory/import: primero dryRun=true, luego dryRun=false) */
  showBulk = false;
  bulkTab: 'Productos' | 'Precios' = 'Productos';
  bulkFile: File | null = null;
  dragOver = false;
  bulkPreview: ImportResult | null = null;
  bulkLoading = false;
  bulkSaving = false;
  bulkError = '';
  downloadingTemplate = false;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadLowStockCount();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.inventoryService.getAll(0, MAX_PRODUCTS, undefined, undefined, 'name,asc').subscribe({
      next: (res) => {
        if (res.success) {
          this.allProducts = res.data.content;
          this.initFilters();
          this.applyFilters();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando inventario', err);
        this.loading = false;
      }
    });
  }

  loadLowStockCount(): void {
    this.inventoryService.getLowStock().subscribe({
      next: (res) => { if (res.success) this.lowStockCount = res.data.length; },
      error: () => {}
    });
  }

  // ── Filters ───────────────────────────────────────────────────────────────

  /** Recalcula las opciones de filtro; al recargar (guardar, crear, carga masiva) conserva lo elegido. */
  private initFilters(): void {
    const priceFiltered = this.maxPrice < this.priceMax;

    this.brands = filterOptions(this.allProducts.map(p => filterKey(p.brand, NO_BRAND)), NO_BRAND);
    this.selectedBrands = this.selectedBrands.filter(b => this.brands.includes(b));  // vacío = todas

    this.cats = filterOptions(this.allProducts.map(p => filterKey(p.category, NO_CATEGORY)), NO_CATEGORY);
    this.selectedCats = this.selectedCats.filter(c => this.cats.includes(c));  // vacío = todas

    const prices = this.allProducts.map(p => Number(p.unitPrice)).filter(n => Number.isFinite(n));
    const maxP = prices.length ? Math.max(...prices) : 6000;
    this.priceMax = Math.max(Math.ceil(maxP / 1000) * 1000, 1000);
    this.maxPrice = priceFiltered ? Math.min(this.maxPrice, this.priceMax) : this.priceMax;

    // Merge categories from DB into the create-form list
    const allCats = new Set([...DEFAULT_CATEGORIES, ...this.cats.filter(c => c !== NO_CATEGORY)]);
    this.createCategories = Array.from(allCats).sort();
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase();
    this.filteredProducts = this.allProducts.filter(p => {
      if (search &&
          !p.name.toLowerCase().includes(search) &&
          !(p.sku || '').toLowerCase().includes(search) &&
          !(p.brand || '').toLowerCase().includes(search)) return false;
      if (this.selectedBrands.length && !this.selectedBrands.includes(filterKey(p.brand, NO_BRAND))) return false;
      if (this.selectedCats.length && !this.selectedCats.includes(filterKey(p.category, NO_CATEGORY))) return false;
      if (Number(p.unitPrice) > this.maxPrice) return false;
      if (this.onlyStock && !(Number(p.stockQuantity) > 0)) return false;
      return true;
    });
  }

  hasActiveFilters(): boolean {
    return this.selectedBrands.length > 0 || this.selectedCats.length > 0
      || this.maxPrice < this.priceMax || this.onlyStock;
  }

  clearFilters(): void {
    this.selectedBrands = [];
    this.selectedCats = [];
    this.maxPrice = this.priceMax;
    this.onlyStock = false;
    this.applyFilters();
  }

  onPriceChange(): void { this.applyFilters(); }
  onStockChange(): void { this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getIcon(category: string): string {
    const map: Record<string, string> = {
      'pH / ORP':              '⚗️',
      'Colorímetro':           '💧',
      'Multiparámetro':        '🔬',
      'Conductividad':         '⚡',
      'Videovigilancia':       '📷',
      'Sensores':              '📡',
      'Automatización':        '⚙️',
      'Materiales eléctricos': '🔌',
      'Servicios':             '🛠️',
      'EPP':                   '🦺',
    };
    return map[category] || '📦';
  }

  inStock(p: ProductResponse | undefined): boolean {
    return !!p && Number(p.stockQuantity) > 0;
  }

  // ── Detail / Edit modal ───────────────────────────────────────────────────

  openDetail(p: ProductResponse): void {
    this.selectedProduct = { ...p };
    // Precios en soles enteros (V10): el campo de edición no arrastra decimales antiguos
    this.editForm = { ...p, unitPrice: p.unitPrice != null ? Math.round(Number(p.unitPrice)) : p.unitPrice };
    this.editMode = false;
    this.descExpanded = false;
    this.showDetail = true;
  }

  /** El cuadro muestra ~4 líneas: más texto o más saltos de línea que eso se recorta y muestra "Ver más". */
  isLongDescription(): boolean {
    const desc = this.selectedProduct?.description?.trim() ?? '';
    return desc.length > 220 || desc.split('\n').length > 4;
  }

  closeDetail(): void { this.showDetail = false; this.editMode = false; }
  toggleEdit(): void { this.editMode = !this.editMode; }

  saveEdit(): void {
    if (!this.selectedProduct) return;
    this.saving = true;
    const id = this.selectedProduct.id;

    const req: ProductRequest = {
      sku:           this.selectedProduct.sku,
      name:          this.editForm.name     || this.selectedProduct.name,
      category:      this.editForm.category,
      description:   this.editForm.description,
      unit:          this.editForm.unit,
      stockQuantity: Number(this.editForm.stockQuantity ?? this.selectedProduct.stockQuantity),
      unitPrice:     Number(this.editForm.unitPrice     ?? this.selectedProduct.unitPrice),
      currency:      this.editForm.currency,
      supplierName:  this.editForm.supplierName,
      brand:         this.editForm.brand,
    };

    this.inventoryService.update(id, req).subscribe({
      next: () => {
        const stockChanged = Number(this.editForm.stockQuantity) !== Number(this.selectedProduct!.stockQuantity);
        if (stockChanged) {
          this.inventoryService.updateStock(id, Number(this.editForm.stockQuantity!)).subscribe({
            next: () => this.reloadAndClose(),
            error: (err) => { console.error('Error actualizando stock', err); this.saving = false; }
          });
        } else {
          this.reloadAndClose();
        }
      },
      error: (err) => {
        console.error('Error actualizando producto', err);
        this.saving = false;
      }
    });
  }

  private reloadAndClose(): void {
    this.saving = false;
    this.editMode = false;
    this.showDetail = false;
    this.loadProducts();
    this.loadLowStockCount();
  }

  // ── Create product modal ──────────────────────────────────────────────────

  openCreate(): void {
    this.createForm = { currency: 'PEN', stockQuantity: 0, unitPrice: 0, minStockThreshold: 5 };
    this.showCreate = true;
  }

  closeCreate(): void { this.showCreate = false; this.createForm = {}; }

  submitCreate(): void {
    if (!this.createForm.sku || !this.createForm.name) return;
    this.creating = true;
    const req: ProductRequest = {
      sku:               this.createForm.sku,
      name:              this.createForm.name,
      category:          this.createForm.category,
      description:       this.createForm.description,
      unit:              this.createForm.unit,
      stockQuantity:     Number(this.createForm.stockQuantity ?? 0),
      minStockThreshold: Number(this.createForm.minStockThreshold ?? 5),
      unitPrice:         Number(this.createForm.unitPrice ?? 0),
      currency:          this.createForm.currency || 'PEN',
      supplierName:      this.createForm.supplierName,
      brand:             this.createForm.brand,
    };
    this.inventoryService.create(req).subscribe({
      next: (res) => {
        this.creating = false;
        if (res.success) {
          this.closeCreate();
          this.loadProducts();
          this.loadLowStockCount();
        }
      },
      error: (err) => {
        console.error('Error creando producto', err);
        this.creating = false;
      }
    });
  }

  // ── Bulk upload modal ─────────────────────────────────────────────────────

  openBulk(): void {
    this.resetBulk();
    this.bulkTab = 'Productos';
    this.showBulk = true;
  }

  closeBulk(): void {
    if (this.bulkSaving) return;
    this.showBulk = false;
    this.resetBulk();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setBulkFile(input.files[0]);
    input.value = '';   // permite volver a elegir el mismo archivo
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files.length) this.setBulkFile(event.dataTransfer.files[0]);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }
  removeFile(): void { this.resetBulk(); }

  /** Vista previa real: el backend analiza el archivo sin guardar nada. */
  private setBulkFile(file: File): void {
    this.resetBulk();
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.bulkError = 'Formato no soportado: sube un archivo Excel .xlsx';
      return;
    }
    this.bulkFile = file;
    this.bulkLoading = true;
    this.inventoryService.importExcel(file, true).subscribe({
      next: (res) => {
        this.bulkLoading = false;
        this.bulkPreview = res.data;
      },
      error: (err) => {
        this.bulkLoading = false;
        this.bulkError = this.apiError(err, 'No se pudo analizar el archivo.');
      }
    });
  }

  downloadTemplate(): void {
    this.downloadingTemplate = true;
    this.inventoryService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla-inventario.xlsx';
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingTemplate = false;
      },
      error: () => {
        this.downloadingTemplate = false;
        this.bulkError = 'No se pudo descargar la plantilla. Intente nuevamente.';
      }
    });
  }

  canFinalizeBulk(): boolean {
    return !!this.bulkPreview && !this.bulkLoading && !this.bulkSaving
      && (this.bulkPreview.created + this.bulkPreview.updated) > 0;
  }

  finalizeBulk(): void {
    if (!this.canFinalizeBulk() || !this.bulkFile) return;
    this.bulkSaving = true;
    this.bulkError = '';
    this.inventoryService.importExcel(this.bulkFile, false).subscribe({
      next: (res) => {
        this.bulkSaving = false;
        this.closeBulk();
        this.loadProducts();
        this.loadLowStockCount();
        alert(res.message);
      },
      error: (err) => {
        this.bulkSaving = false;
        this.bulkError = this.apiError(err, 'No se pudo completar la carga. No se guardó ningún cambio.');
      }
    });
  }

  /** Filas cuyo precio cambia (nuevas o actualizadas), para la pestaña "Precios". */
  bulkPriceRows(): ImportRow[] {
    return (this.bulkPreview?.rows ?? []).filter(r =>
      (r.action === 'CREATE' || r.action === 'UPDATE') && Number(r.oldPrice) !== Number(r.newPrice));
  }

  priceDiff(row: ImportRow): 'up' | 'down' | 'same' | 'added' {
    if (row.oldPrice == null) return 'added';
    if (Number(row.newPrice) > Number(row.oldPrice)) return 'up';
    if (Number(row.newPrice) < Number(row.oldPrice)) return 'down';
    return 'same';
  }

  actionLabel(action: ImportAction): string {
    const labels: Record<ImportAction, string> = {
      CREATE: 'Nuevo', UPDATE: 'Actualiza', UNCHANGED: 'Sin cambios', ERROR: 'Error',
    };
    return labels[action];
  }

  private resetBulk(): void {
    this.bulkFile = null;
    this.bulkPreview = null;
    this.bulkLoading = false;
    this.bulkError = '';
  }

  private apiError(err: any, fallback: string): string {
    return err?.error?.message || fallback;
  }
}
