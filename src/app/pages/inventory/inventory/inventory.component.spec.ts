import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { InventoryModule } from '../inventory.module';
import { InventoryComponent } from './inventory.component';
import { InventoryService } from '../../../services/inventory.service';
import { ProductResponse } from '../../../core/models/product.model';

function product(id: number, brand: string | null, category: string | null, unitPrice = 100): ProductResponse {
  return { id, sku: 'SKU-' + id, name: 'Producto ' + id, brand, category, unitPrice, stockQuantity: 10 } as any;
}

describe('InventoryComponent — filtros', () => {
  let fixture: ComponentFixture<InventoryComponent>;
  let component: InventoryComponent;
  let products: ProductResponse[];

  beforeEach(() => {
    products = [
      product(1, 'Zeta', 'Sensores', 2500),
      product(2, 'ácido', 'EPP'),
      product(3, '', null),
      product(4, '   ', 'EPP'),
      product(5, 'HANNA', 'Sensores'),
    ];
    const inventoryService = jasmine.createSpyObj<InventoryService>('InventoryService', ['getAll', 'getLowStock']);
    inventoryService.getAll.and.callFake(() => of({ success: true, data: { content: products } } as any));
    inventoryService.getLowStock.and.returnValue(of({ success: true, data: [] } as any));

    TestBed.configureTestingModule({
      imports: [InventoryModule, NoopAnimationsModule],
      providers: [{ provide: InventoryService, useValue: inventoryService }],
    });
    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('sin filtros elegidos muestra todos los productos', () => {
    expect(component.selectedBrands).toEqual([]);
    expect(component.filteredProducts.length).toBe(5);
  });

  it('agrega "(Sin marca)" al inicio y ordena el resto sin distinguir mayúsculas ni tildes', () => {
    expect(component.brands).toEqual(['(Sin marca)', 'ácido', 'HANNA', 'Zeta']);
    expect(component.cats).toEqual(['(Sin categoría)', 'EPP', 'Sensores']);
  });

  it('los productos sin marca ya no pasan cuando se filtra por otra marca', () => {
    component.selectedBrands = ['HANNA'];
    component.applyFilters();
    expect(component.filteredProducts.map(p => p.id)).toEqual([5]);
  });

  it('"(Sin marca)" incluye marcas vacías o solo con espacios', () => {
    component.selectedBrands = ['(Sin marca)'];
    component.applyFilters();
    expect(component.filteredProducts.map(p => p.id)).toEqual([3, 4]);
  });

  it('"(Sin categoría)" filtra los productos sin categoría', () => {
    component.selectedCats = ['(Sin categoría)'];
    component.applyFilters();
    expect(component.filteredProducts.map(p => p.id)).toEqual([3]);
  });

  it('al recargar la lista conserva los filtros elegidos', () => {
    component.selectedBrands = ['HANNA', 'Zeta'];
    component.maxPrice = 1000;
    products = products.filter(p => p.brand !== 'Zeta');   // Zeta ya no existe tras recargar
    component.loadProducts();
    expect(component.selectedBrands).toEqual(['HANNA']);
    expect(component.maxPrice).toBe(1000);
  });

  it('"Limpiar filtros" reinicia marca, categoría, precio y stock', () => {
    component.selectedBrands = ['HANNA'];
    component.selectedCats = ['EPP'];
    component.maxPrice = 0;
    component.onlyStock = true;
    expect(component.hasActiveFilters()).toBeTrue();

    component.clearFilters();
    expect(component.hasActiveFilters()).toBeFalse();
    expect(component.filteredProducts.length).toBe(5);
  });

  it('muestra "Ver descripción completa" solo si el texto excede ~4 líneas', () => {
    component.openDetail({ ...products[0], description: 'Corta' } as any);
    expect(component.isLongDescription()).toBeFalse();

    component.openDetail({ ...products[0], description: 'x'.repeat(300) } as any);
    expect(component.isLongDescription()).toBeTrue();

    component.openDetail({ ...products[0], description: 'a\nb\nc\nd\ne' } as any);
    expect(component.isLongDescription()).toBeTrue();
    expect(component.descExpanded).toBeFalse();
  });
});
