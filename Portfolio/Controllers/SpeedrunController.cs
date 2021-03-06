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
using Portfolio.Models.Errors;
using Portfolio.Extensions;

namespace Portfolio.Controllers
{
    public class SpeedrunController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Speedrunner.ToString() };

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
            List<Course> courses = _srContext.Courses.Include(c => c.Stars).ToList();
            _logger.LogDebug($"Found {courses.Count} total courses.");
            return Ok(courses);
        }

        [HttpGet]
        [Route("Speedrun/GetStarTimes")]
        public IActionResult GetStarTimes()
        {
            return Ok(_srContext.StarTimes.Select(st => st.WithClientView()).ToList());
        }

        [HttpGet]
        [Route("Speedrun/GetArchivedStarTimes")]
        public IActionResult GetArchivedStarTimes()
        {
            return Ok(_srContext.ArchivedStarTimes.Select(st => st.WithClientView()).ToList());
        }

        [HttpDelete]
        [Route("Speedrun/DeleteArchivedStarTime/{id}")]
        public async Task<IActionResult> DeleteArchivedStarTime(int id)
        {
            var currentUser = await GetCurrentUser();
            bool userIsAdmin = await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString());

            if (await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Guest.ToString()))
                throw new UnauthorizedException("Cannot make modifications as a guest");

            var archive = await _srContext.ArchivedStarTimes.FindAsync(id);

            if (!userIsAdmin && archive.UserId != currentUser.Id)
                throw new UnauthorizedException("Cannot delete archive for other users");

            _srContext.ArchivedStarTimes.Remove(archive);
            await _srContext.SaveChangesAsync();
            return Ok();
        }

        [HttpPost]
        [Route("Speedrun/UpdateStarTime")]
        public async Task<IActionResult> UpdateStarTime([FromBody]StarTime starTime)
        {
            var currentUser = await GetCurrentUser();
            bool userIsAdmin = await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString());

            if (await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Guest.ToString()))
                throw new UnauthorizedException("Cannot make modifications as a guest");

            if (!userIsAdmin && starTime.UserId != currentUser.Id)
                throw new UnauthorizedException("Cannot modify star times for other users");

            starTime.LastUpdated = DateTime.UtcNow;
            var existingStarTime = _srContext.StarTimes.AsNoTracking().ToList().FirstOrDefault(st => st.StarId == starTime.StarId && st.UserId == starTime.UserId);

            if (starTime.Frames.HasValue && (existingStarTime == null || existingStarTime.Time.GetFrames() != starTime.Frames))
                starTime.Time = TimeSpan.FromSeconds(starTime.Frames.Value / 29.97);

            if (existingStarTime != null)
            {
                var archivedStarTime = existingStarTime.AsArchive();
                await _srContext.ArchivedStarTimes.AddAsync(archivedStarTime);

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

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
