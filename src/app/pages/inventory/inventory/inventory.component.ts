import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../services/inventory.service';
import { ProductResponse, ProductRequest } from '../../../core/models/product.model';

interface BulkProductRow { name: string; brand: string; qty: number; }
interface BulkPriceRow  { name: string; brand: string; old: number; nuevo: number; }

const DEFAULT_CATEGORIES = [
  'pH / ORP', 'Colorímetro', 'Multiparámetro', 'Conductividad',
  'Videovigilancia', 'Sensores', 'Automatización', 'Materiales eléctricos',
  'Servicios', 'EPP',
];

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
  editForm: Partial<ProductResponse> = {};
  saving = false;

  /* Create product modal */
  showCreate = false;
  creating = false;
  createForm: Partial<ProductRequest> = {};
  createCategories: string[] = DEFAULT_CATEGORIES;

  /* Bulk upload modal */
  showBulk = false;
  bulkTab: 'Productos' | 'Precios' = 'Productos';
  bulkFile: File | null = null;
  dragOver = false;

  bulkProductsMock: BulkProductRow[] = [
    { name: 'Medidor combo pH/Con/TDS HI98130', brand: 'HANNA · Multiparámetro', qty: 20 },
    { name: 'Balanza de precisión 220gr',       brand: 'XYSCALE · XY200-2C',    qty: 15 },
    { name: 'Sensor temperatura tipo K',        brand: 'OMEGA · KTSS-HH',       qty: 8  },
    { name: 'Termómetro infrarojo industrial',  brand: 'EXTECH · IR267',         qty: 12 },
  ];

  bulkPricesMock: BulkPriceRow[] = [
    { name: 'Medidor combo pH/Con/TDS HI98130', brand: 'HANNA · Multiparámetro', old: 890,  nuevo: 950  },
    { name: 'Colorímetro Checker HC cloro',      brand: 'HANNA · Colorímetro',   old: 245,  nuevo: 230  },
    { name: 'ProQuatro multiparámetro',          brand: 'YSI · Multiparámetro',  old: 2800, nuevo: 2800 },
    { name: 'SevenCompact S210',                 brand: 'Mettler · pH / ORP',    old: 1450, nuevo: 1550 },
  ];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadLowStockCount();
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  loadProducts(): void {
    this.loading = true;
    this.inventoryService.getAll().subscribe({
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

  private initFilters(): void {
    const brandSet = new Set(this.allProducts.map(p => p.brand).filter(b => !!b));
    this.brands = Array.from(brandSet).sort();
    this.selectedBrands = [...this.brands];

    const catSet = new Set(this.allProducts.map(p => p.category).filter(c => !!c));
    this.cats = Array.from(catSet).sort();
    this.selectedCats = [...this.cats];

    const prices = this.allProducts.map(p => Number(p.unitPrice));
    const maxP = prices.length ? Math.max(...prices) : 6000;
    this.priceMax = Math.ceil(maxP / 1000) * 1000;
    this.maxPrice = this.priceMax;

    // Merge categories from DB into the create-form list
    const allCats = new Set([...DEFAULT_CATEGORIES, ...this.cats]);
    this.createCategories = Array.from(allCats).sort();
  }

  applyFilters(): void {
    const search = this.searchText.toLowerCase();
    this.filteredProducts = this.allProducts.filter(p => {
      if (search &&
          !p.name.toLowerCase().includes(search) &&
          !(p.sku || '').toLowerCase().includes(search) &&
          !(p.brand || '').toLowerCase().includes(search)) return false;
      if (this.selectedBrands.length && p.brand && !this.selectedBrands.includes(p.brand)) return false;
      if (this.selectedCats.length && p.category && !this.selectedCats.includes(p.category)) return false;
      if (Number(p.unitPrice) > this.maxPrice) return false;
      if (this.onlyStock && !(Number(p.stockQuantity) > 0)) return false;
      return true;
    });
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
    this.editForm = { ...p };
    this.editMode = false;
    this.showDetail = true;
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

  openBulk(): void { this.showBulk = true; this.bulkFile = null; this.bulkTab = 'Productos'; }
  closeBulk(): void { this.showBulk = false; this.bulkFile = null; }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.bulkFile = input.files[0];
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    if (event.dataTransfer?.files.length) this.bulkFile = event.dataTransfer.files[0];
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }
  removeFile(): void { this.bulkFile = null; }

  finalizeBulk(): void {
    this.closeBulk();
    alert('Carga masiva finalizada correctamente.');
  }

  bulkDifferentCount(): number {
    return this.bulkPricesMock.filter(r => r.old !== r.nuevo).length;
  }

  priceDiff(row: BulkPriceRow): 'up' | 'down' | 'same' {
    if (row.nuevo > row.old) return 'up';
    if (row.nuevo < row.old) return 'down';
    return 'same';
  }

  totalUnits(): number {
    return this.bulkProductsMock.reduce((sum, r) => sum + r.qty, 0);
  }
}
