using Microsoft.EntityFrameworkCore;
using GestionProduits.Api.Models;

namespace GestionProduits.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Produit> Produits { get; set; }
}
