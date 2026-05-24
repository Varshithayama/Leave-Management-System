using LeaveManagement.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeaveTypesController : ControllerBase
{
    private readonly AppDbContext _db;
    public LeaveTypesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var types = await _db.LeaveTypes
            .Where(t => t.IsActive)
            .Select(t => new { t.Id, t.Name, t.Code, t.DefaultDays, t.CarryForward })
            .ToListAsync();
        return Ok(types);
    }
}
