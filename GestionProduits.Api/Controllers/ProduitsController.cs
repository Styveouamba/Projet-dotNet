using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestionProduits.Api.Data;
using GestionProduits.Api.Models;

namespace GestionProduits.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProduitsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProduitsController> _logger;

    public ProduitsController(AppDbContext context, ILogger<ProduitsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Produit>>> GetProduits()
    {
        _logger.LogInformation("Récupération de tous les produits");
        return await _context.Produits.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Produit>> GetProduit(int id)
    {
        var produit = await _context.Produits.FindAsync(id);

        if (produit == null)
        {
            _logger.LogWarning("Produit {Id} non trouvé", id);
            return NotFound();
        }

        return produit;
    }

    [HttpPost]
    public async Task<ActionResult<Produit>> CreateProduit(Produit produit)
    {
        _context.Produits.Add(produit);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Produit créé avec succès: {Nom}", produit.Nom);

        return CreatedAtAction(nameof(GetProduit), new { id = produit.Id }, produit);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduit(int id, Produit produit)
    {
        if (id != produit.Id)
        {
            return BadRequest();
        }

        _context.Entry(produit).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("Produit {Id} mis à jour", id);
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ProduitExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduit(int id)
    {
        var produit = await _context.Produits.FindAsync(id);
        if (produit == null)
        {
            return NotFound();
        }

        _context.Produits.Remove(produit);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Produit {Id} supprimé", id);

        return NoContent();
    }

    private async Task<bool> ProduitExists(int id)
    {
        return await _context.Produits.AnyAsync(e => e.Id == id);
    }
}
