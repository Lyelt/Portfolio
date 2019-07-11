using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    //[Route("api/[controller]")]
    public class SpeedrunController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Speedrunner.ToString()};

        private readonly SpeedrunContext _srContext;
        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;

        public SpeedrunController(SpeedrunContext context, PortfolioContext userContext, UserManager<ApplicationUser> userManager)
        {
            _srContext = context;
            _userContext = userContext;
            _userManager = userManager;
        }

        [HttpGet]
        [Route("Speedrun/GetUsers")]
        public IActionResult GetUsers()
        {
            var validRoles = _userContext.Roles.Where(r => VALID_ROLES.Contains(r.Name));
            var validUserRoles = _userContext.UserRoles.Join(validRoles, ur => ur.RoleId, r => r.Id, (userRole, role) => userRole);
            var validUsers = _userContext.Users.Join(validUserRoles, u => u.Id, ur => ur.UserId, (user, userRole) => user).Distinct();

            return Ok(validUsers.ToList());
        }

        [HttpGet]
        [Route("Speedrun/GetCourses")]
        public IActionResult GetCourses()
        {
            List<Course> courses = _srContext.Courses.Include(c => c.Stars).ToList();
            return Ok(courses);
        }

        [HttpGet]
        [Route("Speedrun/GetStarTimes")]
        public IActionResult GetStarTimes()
        {
            return Ok(_srContext.StarTimes.ToList());
        }

        [HttpPost]
        [Route("Speedrun/UpdateStarTime")]
        public async Task<IActionResult> UpdateStarTime(StarTime starTime)
        {
            var currentUser = await GetCurrentUser();
            bool userIsAdmin = User.IsInRole(ApplicationRole.Administrator.ToString());

            if (userIsAdmin || starTime.UserId == currentUser.Id)
            {
                // if (_srContext.Find(starTime.UserId, starTime.StarId)
                //     update
                // else add
                _srContext.StarTimes.Update(starTime);
                await _srContext.SaveChangesAsync();
                return Ok();
            }
           
            // Warn the user if they tried to make unauthorized changes.
            return StatusCode((int)System.Net.HttpStatusCode.Unauthorized, "Cannot edit other users' data.");
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
