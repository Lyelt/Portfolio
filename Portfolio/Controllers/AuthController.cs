using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Areas.Identity;
using Portfolio.Models;

namespace Portfolio.Controllers
{
    public class AuthController : Controller
    {
        private readonly PortfolioContext _context;
        private readonly IPasswordHasher<ApplicationUser> _hasher;
        private readonly ILogger<AuthController> _logger;

        public AuthController(PortfolioContext context, IPasswordHasher<ApplicationUser> hasher, ILogger<AuthController> logger)
        {
            _context = context;
            _hasher = hasher;
            _logger = logger;
        }


        [HttpPost]
        [AllowAnonymous]
        [Route("Auth/Login")]
        public IActionResult Login([FromBody]Credentials credentials)
        {
            if (credentials?.Username == null || credentials?.Password == null)
                return BadRequest("Invalid client request");

            var user = _context.Users.FirstOrDefault(u => u.UserName.Equals(credentials.Username, StringComparison.OrdinalIgnoreCase));

            if (user != null)
            {
                var passwordResult =_hasher.VerifyHashedPassword(user, user.PasswordHash, credentials.Password);

                if (passwordResult != PasswordVerificationResult.Failed)
                {
                    var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECURITY_KEY")));
                    var signingCreds = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

                    var tokeOptions = new JwtSecurityToken(
                        issuer: IdentityHelpers.ValidIssuer,
                        audience: IdentityHelpers.ValidAudience,
                        claims: new List<Claim>(),
                        expires: DateTime.Now.AddDays(30),
                        signingCredentials: signingCreds
                    );

                    var tokenString = new JwtSecurityTokenHandler().WriteToken(tokeOptions);
                    return Ok(new { Token = tokenString });
                }
            }

            return Unauthorized();
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Auth/TestLogin")]
        public IActionResult TestLogin([FromBody]string testString)
        {
            _logger.LogCritical("TEST MESSAGE. Test login method has been reached.");
            return Unauthorized();
        }
    }
}
