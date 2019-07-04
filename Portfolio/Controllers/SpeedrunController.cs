using Microsoft.AspNetCore.Mvc;
using Portfolio.Data;
using Portfolio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Controllers
{
    //[Route("api/[controller]")]
    public class SpeedrunController : Controller
    {
        private SpeedrunContext _context;

        public SpeedrunController(SpeedrunContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Route("Speedrun/GetStarTimes")]
        public IActionResult GetStarTimes()
        {
            return Ok(_context.StarTimes.ToList());
        }

        [HttpPost]
        [Route("Speedrun/AddStarTimes")]
        public async Task<IActionResult> AddStarTimes(List<StarTime> starTimes)
        {
            await _context.StarTimes.AddRangeAsync(starTimes);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut]
        [Route("Speedrun/UpdateStarTimes")]
        public async Task<IActionResult> UpdateStarTimes(List<StarTime> starTimes)
        {
            _context.StarTimes.UpdateRange(starTimes);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
