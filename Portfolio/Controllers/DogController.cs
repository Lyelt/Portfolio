using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Data;
using Portfolio.Identity;
using Portfolio.Models.Auth;
using Portfolio.Models.Dog;
using Portfolio.Models.Errors;

namespace Portfolio.Controllers
{
    public class DogController : Controller
    {

        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.DogOwner.ToString() };

        private readonly PortfolioContext _context;
        private readonly ILogger<DogController> _logger;
        private readonly IDogService _dogService;

        public DogController(PortfolioContext context, ILogger<DogController> logger, IDogService dogService)
        {
            _context = context;
            _logger = logger;
            _dogService = dogService;
        }

        [HttpGet]
        [Route("Dog/Outside")]
        public IActionResult Outside()
        {
            return Ok(_dogService.GetOutsideDog());
        }

        [HttpGet]
        [Route("Dog/GetUsers")]
        public IActionResult GetUsers()
        {
            var dogOwners = _context.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {dogOwners.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(dogOwners);
        }
    }
}
