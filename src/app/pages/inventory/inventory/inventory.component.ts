import { Component, OnInit } from '@angular/core';
import { ProductosService, Producto } from '../../../services/productos.service';

interface BulkProductRow { name: string; brand: string; qty: number; }
interface BulkPriceRow  { name: string; brand: string; old: number; nuevo: number; }

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  /* Sidebar filters */
  brands = ['HANNA', 'YSI', 'Mettler', 'Hach'];
  cats   = ['pH / ORP', 'Conductividad', 'Colorímetro', 'Multiparámetro'];
  selectedBrands: string[] = [...this.brands];
  selectedCats:   string[] = [...this.cats];
  maxPrice = 3000;
  onlyStock = false;
  searchText = '';

  /* Products */
  allProducts: Producto[] = [];
  filteredProducts: Producto[] = [];

  /* Product detail modal */
  showDetail = false;
  selectedProduct?: Producto;
  editMode = false;
  editForm: Partial<Producto> = {};

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

  constructor(private svc: ProductosService) {}

  ngOnInit(): void {
    this.allProducts = this.svc.getAll();
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.svc.filterBy({
      search: this.searchText,
      brands: this.selectedBrands,
      cats:   this.selectedCats,
      maxPrice: this.maxPrice,
      onlyStock: this.onlyStock
    });
  }

  toggleBrand(b: string): void {
    this.selectedBrands = this.selectedBrands.includes(b)
      ? this.selectedBrands.filter(x => x !== b)
      : [...this.selectedBrands, b];
    this.applyFilters();
  }

  toggleCat(c: string): void {
    this.selectedCats = this.selectedCats.includes(c)
      ? this.selectedCats.filter(x => x !== c)
      : [...this.selectedCats, c];
    this.applyFilters();
  }

  onPriceChange(): void { this.applyFilters(); }
  onStockChange(): void { this.applyFilters(); }
  onSearch(): void { this.applyFilters(); }

  openDetail(p: Producto): void {
    this.selectedProduct = { ...p };
    this.editForm = { ...p };
    this.editMode = false;
    this.showDetail = true;
  }

  closeDetail(): void { this.showDetail = false; this.editMode = false; }

  toggleEdit(): void { this.editMode = !this.editMode; }

  saveEdit(): void {
    if (!this.selectedProduct) return;
    this.svc.updateProduct(this.selectedProduct.id, this.editForm);
    this.allProducts = this.svc.getAll();
    this.applyFilters();
    this.editMode = false;
    this.showDetail = false;
  }

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
