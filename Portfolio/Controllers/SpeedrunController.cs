using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Areas.Identity;
using Portfolio.Data;
using Portfolio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Portfolio.Controllers
{
    public class SpeedrunController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Speedrunner.ToString()};

        private readonly SpeedrunContext _srContext;
        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<SpeedrunController> _logger;

        public SpeedrunController(SpeedrunContext context, PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<SpeedrunController> logger)
        {
            _srContext = context;
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        [Route("Speedrun/GetUsers")]
        public IActionResult GetUsers()
        {
            try
            {
                var validRoles = _userContext.Roles.Where(r => VALID_ROLES.Contains(r.Name));
                var validUserRoles = _userContext.UserRoles.Join(validRoles, ur => ur.RoleId, r => r.Id, (userRole, role) => userRole);
                var validUsers = _userContext.Users.Join(validUserRoles, u => u.Id, ur => ur.UserId, (user, userRole) => user).Distinct().ToList();

                _logger.LogDebug($"Found {validUsers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
                return Ok(validUsers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining user information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Speedrun/GetCourses")]
        public IActionResult GetCourses()
        {
            try
            {
                List<Course> courses = _srContext.Courses.Include(c => c.Stars).ToList();
                _logger.LogDebug($"Found {courses.Count} total courses.");
                return Ok(courses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining course information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Speedrun/GetStarTimes")]
        public IActionResult GetStarTimes()
        {
            return Ok(_srContext.StarTimes.Select(st => st.WithClientView()).ToList());
        }

        [HttpPost]
        [Route("Speedrun/UpdateStarTime")]
        public async Task<IActionResult> UpdateStarTime([FromBody]StarTime starTime)
        {
            try
            {
                var currentUser = await GetCurrentUser();
                bool userIsAdmin = User.IsInRole(ApplicationRole.Administrator.ToString());

                if (userIsAdmin || starTime.UserId == currentUser.Id)
                {
                    if (await _srContext.StarTimes.ContainsAsync(starTime))
                        _srContext.StarTimes.Update(starTime);
                    else
                        await _srContext.StarTimes.AddAsync(starTime);

                    await _srContext.SaveChangesAsync();
                    return Ok();
                }

                // Warn the user if they tried to make unauthorized changes.
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while updating star time: {ex.Message}");
            }
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
