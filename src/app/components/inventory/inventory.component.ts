import { Component, OnInit, ViewChild } from '@angular/core';
import { InventoryService } from '../../services/inventories.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Actualiza la interfaz para incluir tanto Date como string
interface Inventory {
  inventory_id: number;
  product_id: number;
  quantity: number;
  lastUpdated: Date | string;
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
})
export class InventoryComponent implements OnInit {
  @ViewChild('inventoryModal') inventoryModal: any;
  listadoInventory: Inventory[] = [];
  loading = false;
  inventoryForm: FormGroup;
  isEditMode = false;
  currentInventoryId: number | null = null;
  error: string | null = null;

  constructor(
    private inventoryService: InventoryService,
    public authService: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.inventoryForm = this.fb.group({
      productId: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      lastUpdated: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.cargarInventory();
  }

  cargarInventory() {
    if (this.authService.hasAuthority('READ')) {
      this.loading = true;
      this.error = null;

      this.inventoryService.getInventories().subscribe({
        next: (response) => {
          console.log('Respuesta del servicio:', response);
          
          if (response && response.inventories) {
            // Si es un array, úsalo directamente; si no, conviértelo en array
            const inventoriesArray = Array.isArray(response.inventories) 
              ? response.inventories 
              : [response.inventories];
            
            this.listadoInventory = inventoriesArray.map(item => ({
              inventory_id: item.inventory_id,
              product_id: item.product_id,
              quantity: item.quantity,
              lastUpdated: new Date(item.lastUpdated)
            }));
          } else {
            this.listadoInventory = [];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar el inventario:', error);
          this.error = error.message || 'Error al cargar el inventario';
          this.loading = false;
          this.listadoInventory = [];
        }
      });
    }
  }

  onSubmitInventory(modal: any) {
    if (this.inventoryForm.invalid) {
      return;
    }
  
    // Crear el objeto de datos con los tipos correctos
    const inventoryData: Partial<Inventory> = {
      product_id: Number(this.inventoryForm.value.productId),
      quantity: Number(this.inventoryForm.value.quantity),
      lastUpdated: new Date(this.inventoryForm.value.lastUpdated).toISOString()
    };
  
    const request = this.isEditMode
      ? this.inventoryService.updateInventory(this.currentInventoryId!, inventoryData)
      : this.inventoryService.createInventory(inventoryData);
  
    request.subscribe({
      next: (response) => {
        console.log('Operación exitosa:', response);
        modal.close();
        this.cargarInventory();
      },
      error: (error) => {
        console.error('Error en la operación:', error);
        this.error = error.message || 'Error al procesar la operación';
      }
    });
  }

  createInventory() {
    this.isEditMode = false;
    this.currentInventoryId = null;
    this.inventoryForm.reset();
    this.modalService.open(this.inventoryModal, { backdrop: 'static', size: 'lg' });
  }

  editInventory(inventory: Inventory) {
    this.isEditMode = true;
    this.currentInventoryId = inventory.inventory_id;
    
    // Formatear la fecha para el input type="date"
    const date = new Date(inventory.lastUpdated);
    const formattedDate = date.toISOString().split('T')[0];
    
    this.inventoryForm.patchValue({
      productId: inventory.product_id,
      quantity: inventory.quantity,
      lastUpdated: formattedDate
    });
    
    this.modalService.open(this.inventoryModal, { backdrop: 'static', size: 'lg' });
  }

  eliminarInventory(inventoryId: number) {
    if (this.authService.hasAuthority('DELETE')) {
      if (confirm('¿Está seguro que desea eliminar este registro de inventario?')) {
        this.inventoryService.deleteInventory(inventoryId).subscribe({
          next: () => {
            console.log('Inventario eliminado exitosamente');
            this.cargarInventory();
          },
          error: (error) => {
            console.error('Error al eliminar el inventario:', error);
            this.error = error.message || 'Error al eliminar el inventario';
          }
        });
      }
    } else {
      alert('No tienes permiso para eliminar registros del inventario.');
    }
  }
}