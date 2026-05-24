using LeaveManagement.API.Data;
using LeaveManagement.API.DTOs;
using LeaveManagement.API.Models;
using LeaveManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthController(AppDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponseDto(token, user.Id, user.Name, user.Email, user.Role, user.Department));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Department = dto.Department,
            EmployeeCode = dto.EmployeeCode,
            ManagerId = dto.ManagerId,
            JoiningDate = DateTime.UtcNow,
            Role = "Employee"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Create leave balances for the new employee
        var leaveTypes = await _db.LeaveTypes.Where(l => l.IsActive && l.Id != 4).ToListAsync(); // exclude maternity by default
        foreach (var lt in leaveTypes)
        {
            _db.LeaveBalances.Add(new LeaveBalance
            {
                UserId = user.Id,
                LeaveTypeId = lt.Id,
                Year = DateTime.UtcNow.Year,
                TotalDays = lt.DefaultDays
            });
        }
        await _db.SaveChangesAsync();

        var token = _jwt.GenerateToken(user);
        return Ok(new AuthResponseDto(token, user.Id, user.Name, user.Email, user.Role, user.Department));
    }
}
