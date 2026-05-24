using LeaveManagement.API.Data;
using LeaveManagement.API.DTOs;
using LeaveManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    public UsersController(AppDbContext db) => _db = db;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    [Authorize(Roles = "HRAdmin,Manager")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users.Include(u => u.Manager)
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.Role, u.Department,
                u.EmployeeCode, u.JoiningDate, u.ManagerId,
                u.Manager != null ? u.Manager.Name : null, u.IsActive))
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var u = await _db.Users.Include(u => u.Manager).FirstOrDefaultAsync(u => u.Id == id);
        if (u == null) return NotFound();
        return Ok(new UserDto(u.Id, u.Name, u.Email, u.Role, u.Department,
            u.EmployeeCode, u.JoiningDate, u.ManagerId, u.Manager?.Name, u.IsActive));
    }

    // HR Admin: Add new employee with auto leave balance creation
    [HttpPost]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> AddEmployee(AddEmployeeDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email already registered" });

        if (await _db.Users.AnyAsync(u => u.EmployeeCode == dto.EmployeeCode))
            return BadRequest(new { message = "Employee code already exists" });

        // Generate temp password: Emp@EmployeeCode (e.g. Emp@EMP005)
        var tempPassword = $"Emp@{dto.EmployeeCode}";

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword),
            Department = dto.Department,
            EmployeeCode = dto.EmployeeCode,
            Role = dto.Role,
            ManagerId = dto.ManagerId,
            JoiningDate = dto.JoiningDate,
            IsActive = true
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Auto-create leave balances for current year
        var leaveTypes = await _db.LeaveTypes.Where(l => l.IsActive).ToListAsync();
        foreach (var lt in leaveTypes)
        {
            // Skip maternity leave for now — HR can add manually
            if (lt.Code == "ML") continue;
            _db.LeaveBalances.Add(new LeaveBalance
            {
                UserId = user.Id,
                LeaveTypeId = lt.Id,
                Year = DateTime.UtcNow.Year,
                TotalDays = lt.DefaultDays
            });
        }
        await _db.SaveChangesAsync();

        return Ok(new AddEmployeeResponseDto(
            user.Id, user.Name, user.Email, user.Role,
            user.Department, user.EmployeeCode, tempPassword));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> Update(int id, UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.Name = dto.Name;
        user.Department = dto.Department;
        user.ManagerId = dto.ManagerId;
        user.IsActive = dto.IsActive;
        user.Role = dto.Role;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/toggle-status")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync();
        return Ok(new { message = $"Employee {(user.IsActive ? "activated" : "deactivated")}", isActive = user.IsActive });
    }

    [HttpGet("managers")]
    public async Task<IActionResult> GetManagers()
    {
        var managers = await _db.Users
            .Where(u => (u.Role == "Manager" || u.Role == "HRAdmin") && u.IsActive)
            .Select(u => new { u.Id, u.Name, u.Department })
            .ToListAsync();
        return Ok(managers);
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        var user = await _db.Users.FindAsync(UserId);
        if (user == null) return NotFound();
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect" });
        if (dto.NewPassword.Length < 6)
            return BadRequest(new { message = "New password must be at least 6 characters" });
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password updated successfully" });
    }

    // HR: Reset employee password
    [HttpPut("{id}/reset-password")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> ResetPassword(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null) return NotFound();
        var tempPassword = $"Emp@{user.EmployeeCode}";
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password reset successfully", tempPassword });
    }
}
