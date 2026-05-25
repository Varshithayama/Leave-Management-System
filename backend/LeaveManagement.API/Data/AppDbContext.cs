using LeaveManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LeaveManagement.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<LeaveBalance> LeaveBalances => Set<LeaveBalance>();
    public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
    public DbSet<LeaveAuditLog> LeaveAuditLogs => Set<LeaveAuditLog>();
    public DbSet<Holiday> Holidays => Set<Holiday>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // Self-referencing User (Manager → Reportees)
        mb.Entity<User>()
            .HasOne(u => u.Manager)
            .WithMany(u => u.Reportees)
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // LeaveRequest → ApprovedByManager
        mb.Entity<LeaveRequest>()
            .HasOne(l => l.ApprovedByManager)
            .WithMany()
            .HasForeignKey(l => l.ApprovedByManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        mb.Entity<LeaveBalance>()
            .Property(l => l.TotalDays).HasColumnType("decimal(5,1)");
        mb.Entity<LeaveBalance>()
            .Property(l => l.UsedDays).HasColumnType("decimal(5,1)");
        mb.Entity<LeaveBalance>()
            .Property(l => l.PendingDays).HasColumnType("decimal(5,1)");
        mb.Entity<LeaveRequest>()
            .Property(l => l.TotalDays).HasColumnType("decimal(5,1)");

        // Seed Leave Types
        mb.Entity<LeaveType>().HasData(
            new LeaveType { Id = 1, Name = "Annual Leave", Code = "AL", DefaultDays = 18, CarryForward = true },
            new LeaveType { Id = 2, Name = "Sick Leave", Code = "SL", DefaultDays = 12, CarryForward = false },
            new LeaveType { Id = 3, Name = "Casual Leave", Code = "CL", DefaultDays = 6, CarryForward = false },
            new LeaveType { Id = 4, Name = "Maternity Leave", Code = "ML", DefaultDays = 90, CarryForward = false }
        );

        // Seed Users (passwords are hashed "Password@123")
        var hash = BCrypt.Net.BCrypt.HashPassword("Password@123");
        mb.Entity<User>().HasData(
            new User { Id = 1, Name = "HR Admin", Email = "admin@company.com", PasswordHash = hash, Role = "HRAdmin", Department = "HR", EmployeeCode = "EMP001", JoiningDate = new DateTime(2020, 1, 1) },
            new User { Id = 2, Name = "Ravi Kumar", Email = "ravi@company.com", PasswordHash = hash, Role = "Manager", Department = "Engineering", EmployeeCode = "EMP002", JoiningDate = new DateTime(2020, 6, 1), ManagerId = 1 },
            new User { Id = 3, Name = "Priya Singh", Email = "priya@company.com", PasswordHash = hash, Role = "Employee", Department = "Engineering", EmployeeCode = "EMP003", JoiningDate = new DateTime(2022, 3, 15), ManagerId = 2 },
            new User { Id = 4, Name = "Arjun Mehta", Email = "arjun@company.com", PasswordHash = hash, Role = "Employee", Department = "Engineering", EmployeeCode = "EMP004", JoiningDate = new DateTime(2023, 7, 1), ManagerId = 2 }
        );

        // Seed Leave Balances for current year
        int year = 2026;
        int id = 1;
        foreach (var userId in new[] { 2, 3, 4 })
        {
            mb.Entity<LeaveBalance>().HasData(
                new LeaveBalance { Id = id++, UserId = userId, LeaveTypeId = 1, Year = year, TotalDays = 18, UsedDays = 0, PendingDays = 0 },
                new LeaveBalance { Id = id++, UserId = userId, LeaveTypeId = 2, Year = year, TotalDays = 12, UsedDays = 0, PendingDays = 0 },
                new LeaveBalance { Id = id++, UserId = userId, LeaveTypeId = 3, Year = year, TotalDays = 6, UsedDays = 0, PendingDays = 0 }
            );
        }

        // Seed Holidays
        mb.Entity<Holiday>().HasData(
            new Holiday { Id = 1, Name = "Republic Day",     Date = new DateTime(2026, 1, 26),  Year = 2026 },
            new Holiday { Id = 2, Name = "Independence Day", Date = new DateTime(2026, 8, 15),  Year = 2026 },
            new Holiday { Id = 3, Name = "Gandhi Jayanti",   Date = new DateTime(2026, 10, 2),  Year = 2026 },
            new Holiday { Id = 4, Name = "Christmas",        Date = new DateTime(2026, 12, 25), Year = 2026 }
        );
    }
}