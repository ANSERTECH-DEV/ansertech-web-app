import { Injectable } from '@angular/core';

export interface Producto {
  id: number;
  name: string;
  brand: string;
  cat: string;
  price: number;
  units: number;
  stock: boolean;
  icon: string;
  desc: string;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private data: Producto[] = [
    { id: 1, name: 'Medidor combo pH/Con/TDS HI98130', brand: 'HANNA',   cat: 'Multiparámetro', price: 890,  units: 12, stock: true,  icon: '🔬', desc: 'Medidor portátil 3 en 1. Resistente al agua, pantalla LCD y calibración automática.' },
    { id: 2, name: 'Colorímetro Checker HC cloro',      brand: 'HANNA',   cat: 'Colorímetro',    price: 245,  units: 0,  stock: false, icon: '💧', desc: 'Colorímetro portátil para cloro total. Rango 0-2.50 mg/L.' },
    { id: 3, name: 'Tester pH en queso HI981032',       brand: 'HANNA',   cat: 'pH / ORP',       price: 320,  units: 5,  stock: true,  icon: '⚗️', desc: 'pH para quesos. Electrodo con punta cónica, acero inoxidable.' },
    { id: 4, name: 'Medidor pH bolsillo HI98107',       brand: 'HANNA',   cat: 'pH / ORP',       price: 180,  units: 18, stock: true,  icon: '📏', desc: 'pH metro compacto rango 0-14, resolución 0.1 pH.' },
    { id: 5, name: 'ProQuatro multiparámetro',          brand: 'YSI',     cat: 'Multiparámetro', price: 2800, units: 3,  stock: true,  icon: '📡', desc: 'Mide OD, conductividad, temperatura, pH y turbidez.' },
    { id: 6, name: 'Sonda conductividad YSI30',         brand: 'YSI',     cat: 'Conductividad',  price: 950,  units: 0,  stock: false, icon: '⚡', desc: 'Conductividad y salinidad con compensación de temperatura.' },
    { id: 7, name: 'SevenCompact S210',                 brand: 'Mettler', cat: 'pH / ORP',       price: 1450, units: 2,  stock: true,  icon: '🔭', desc: 'pH metro sobremesa alta precisión, pantalla táctil.' },
    { id: 8, name: 'DR900 colorímetro portátil',        brand: 'Hach',    cat: 'Colorímetro',    price: 1200, units: 7,  stock: true,  icon: '🧪', desc: '90+ parámetros, almacena 500 resultados.' },
    { id: 9, name: 'HQ40d multiparámetro',              brand: 'Hach',    cat: 'Multiparámetro', price: 1850, units: 0,  stock: false, icon: '🛠️', desc: 'Acepta 2 sondas simultáneas: pH, OD, conductividad.' },
  ];

  getAll(): Producto[] { return [...this.data]; }

  filterBy(params: { search?: string; brands?: string[]; cats?: string[]; maxPrice?: number; onlyStock?: boolean }): Producto[] {
    return this.data.filter(p => {
      if (params.search && !p.name.toLowerCase().includes(params.search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(params.search.toLowerCase())) return false;
      if (params.brands?.length && !params.brands.includes(p.brand)) return false;
      if (params.cats?.length && !params.cats.includes(p.cat)) return false;
      if (params.maxPrice !== undefined && params.maxPrice < 3000 && p.price > params.maxPrice) return false;
      if (params.onlyStock && !p.stock) return false;
      return true;
    });
  }

  updateProduct(id: number, changes: Partial<Producto>): void {
    const idx = this.data.findIndex(p => p.id === id);
    if (idx !== -1) this.data[idx] = { ...this.data[idx], ...changes };
  }
}
