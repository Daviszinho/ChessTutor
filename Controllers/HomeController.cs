using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TestAzureDevOps.Models;

namespace TestAzureDevOps.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
    }

    public IActionResult Index()
    {
        return View();
    }

    public IActionResult Inicio()
    {
        return View();
    }
    public IActionResult Movimiento()
    {
        return View();
    }

    public IActionResult Historia()
    {
        return View();
    }
    public IActionResult Capturar()
    {
        return View();
    }

    public IActionResult Extraordinarios()
    {
        return View();
    }
    public IActionResult Ritmo()
    {
        return View();
    }
    public IActionResult Nomeclatura()
    {
        return View();
    }
    public IActionResult Aperturas()
    {
        return View();
    }
    public IActionResult Ejercicios()
    {
        return View();
    }
    public IActionResult JugarStockfish()
    {
        return View();
    }
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
