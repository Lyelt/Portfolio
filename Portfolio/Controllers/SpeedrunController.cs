using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Identity;
using Portfolio.Data;
using Portfolio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Portfolio.Models.Speedrun;
using Portfolio.Models.Auth;

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
            var speedrunners = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {speedrunners.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(speedrunners);
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
                return NotFound($"Error while obtaining course information.");
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
                bool userIsAdmin = await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString());

                if (userIsAdmin || starTime.UserId == currentUser.Id)
                {
                    starTime.LastUpdated = DateTime.UtcNow;

                    if (await _srContext.StarTimes.ContainsAsync(starTime))
                    {
                        if (starTime.Time == TimeSpan.Zero)
                            _srContext.StarTimes.Remove(starTime);
                        else
                            _srContext.StarTimes.Update(starTime);
                    }
                    else
                    {
                        await _srContext.StarTimes.AddAsync(starTime);
                    }

                    await _srContext.SaveChangesAsync();
                    return Ok();
                }

                // Warn the user if they tried to make unauthorized changes.
                return Unauthorized();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while updating star time.");
            }
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
