import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../services/produit.service';
import { Produit } from '../models/produit';

@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.scss']
})
export class ProduitsComponent {
  protected readonly produits = signal<Produit[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly isEditing = signal(false);
  protected readonly produitForm = signal({
    nom: '',
    description: '',
    prix: 0,
    quantite: 0
  });
  protected readonly selectedProduit = signal<Produit | null>(null);

  constructor(private readonly produitService: ProduitService) {
    this.loadProduits();
  }

  protected loadProduits(): void {
    this.produitService.getProduits().subscribe({
      next: produits => this.produits.set(produits),
      error: () => this.errorMessage.set('Impossible de charger les produits. Reviens plus tard.')
    });
  }

  protected startEdit(produit: Produit): void {
    this.selectedProduit.set(produit);
    this.produitForm.set({
      nom: produit.nom,
      description: produit.description ?? '',
      prix: produit.prix,
      quantite: produit.quantite
    });
    this.isEditing.set(true);
    this.errorMessage.set('');
  }

  protected resetForm(): void {
    this.selectedProduit.set(null);
    this.produitForm.set({ nom: '', description: '', prix: 0, quantite: 0 });
    this.isEditing.set(false);
    this.errorMessage.set('');
  }

  protected saveProduit(): void {
    const form = this.produitForm();
    if (!form.nom.trim()) {
      this.errorMessage.set('Le nom du produit est requis.');
      return;
    }

    if (this.isEditing()) {
      const current = this.selectedProduit();
      if (!current) {
        return;
      }

      const updated: Produit = {
        ...current,
        nom: form.nom,
        description: form.description,
        prix: form.prix,
        quantite: form.quantite
      };

      this.produitService.updateProduit(updated).subscribe({
        next: () => {
          this.produits.set(this.produits().map(p => p.id === updated.id ? updated : p));
          this.resetForm();
        },
        error: () => this.errorMessage.set('Impossible de mettre à jour le produit.')
      });
      return;
    }

    const newProduit = {
      nom: form.nom,
      description: form.description,
      prix: form.prix,
      quantite: form.quantite
    };

    this.produitService.createProduit(newProduit).subscribe({
      next: produit => {
        this.produits.set([...this.produits(), produit]);
        this.resetForm();
      },
      error: () => this.errorMessage.set('Impossible de créer le produit.')
    });
  }

  protected deleteProduit(id: number): void {
    if (!confirm('Supprimer ce produit ?')) {
      return;
    }

    this.produitService.deleteProduit(id).subscribe({
      next: () => this.produits.set(this.produits().filter(produit => produit.id !== id)),
      error: () => this.errorMessage.set('Impossible de supprimer le produit.')
    });
  }
}
