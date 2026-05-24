using LeaveManagement.API.DTOs;
using LeaveManagement.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LeaveManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LeavesController : ControllerBase
{
    private readonly ILeaveService _leaveService;
    public LeavesController(ILeaveService leaveService) => _leaveService = leaveService;

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string Role => User.FindFirstValue(ClaimTypes.Role)!;

    // ── Employee: Apply leave
    [HttpPost]
    public async Task<IActionResult> Apply(ApplyLeaveDto dto)
    {
        var (success, message, data) = await _leaveService.ApplyLeave(UserId, dto);
        if (!success) return BadRequest(new { message });
        return CreatedAtAction(nameof(GetById), new { id = data!.Id }, data);
    }

    // ── Employee: Get my leaves
    [HttpGet("my")]
    public async Task<IActionResult> GetMy() =>
        Ok(await _leaveService.GetMyLeaves(UserId));

    // ── Get single leave
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var leave = await _leaveService.GetById(id);
        if (leave == null) return NotFound();
        return Ok(leave);
    }

    // ── Employee/Manager: Cancel own or reportee's leave
    [HttpPut("{id}/action")]
    public async Task<IActionResult> Action(int id, ActionLeaveDto dto)
    {
        var validActions = new[] { "Approved", "Rejected", "Cancelled" };
        if (!validActions.Contains(dto.Action))
            return BadRequest(new { message = "Invalid action. Use: Approved, Rejected, Cancelled" });

        if (dto.Action == "Approved" && Role == "Employee")
            return Forbid();

        var (success, message) = await _leaveService.ActionLeave(id, UserId, Role, dto);
        if (!success) return BadRequest(new { message });
        return Ok(new { message });
    }

    // ── Manager: Get team members with their leave balances
    [HttpGet("team")]
    [Authorize(Roles = "Manager,HRAdmin")]
    public async Task<IActionResult> GetTeamMembers()
    {
        var managerId = UserId;
        var reportees = await _leaveService.GetTeamMembers(managerId);
        return Ok(reportees);
    }
    // ── Manager: Get pending team requests
    [HttpGet("pending-approvals")]
    [Authorize(Roles = "Manager,HRAdmin")]
    public async Task<IActionResult> PendingApprovals() =>
        Ok(await _leaveService.GetPendingForManager(UserId));

    // ── HR Admin: Get pending leaves applied BY managers (HR needs to approve these)
    [HttpGet("pending-manager-leaves")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> PendingManagerLeaves() =>
        Ok(await _leaveService.GetPendingManagerLeaves());

    // ── HRAdmin: Get all requests
    [HttpGet("all")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> GetAll() =>
        Ok(await _leaveService.GetAll());

    // ── Get leave balances
    [HttpGet("balances")]
    public async Task<IActionResult> GetBalances() =>
        Ok(await _leaveService.GetBalances(UserId));

    // ── Dashboards
    [HttpGet("dashboard/employee")]
    public async Task<IActionResult> EmployeeDashboard() =>
        Ok(await _leaveService.GetEmployeeDashboard(UserId));

    [HttpGet("dashboard/manager")]
    [Authorize(Roles = "Manager,HRAdmin")]
    public async Task<IActionResult> ManagerDashboard() =>
        Ok(await _leaveService.GetManagerDashboard(UserId));

    [HttpGet("dashboard/hr")]
    [Authorize(Roles = "HRAdmin")]
    public async Task<IActionResult> HRDashboard() =>
        Ok(await _leaveService.GetHRDashboard());
}