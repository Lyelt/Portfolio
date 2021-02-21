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
using Portfolio.Models.Errors;

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
            if (string.IsNullOrWhiteSpace(credentials?.Username) || string.IsNullOrWhiteSpace(credentials?.Password))
                throw new BadRequestException("Username and password cannot be null or empty");

            var user = _context.Users.FirstOrDefault(u => u.UserName.Equals(credentials.Username, StringComparison.OrdinalIgnoreCase));

            if (user != null)
            {
                var passwordResult = _hasher.VerifyHashedPassword(user, user.PasswordHash, credentials.Password);

                if (passwordResult != PasswordVerificationResult.Failed)
                {
                    var tokenString = GetTokenString(user, DateTime.Now.AddDays(180));
                    return Ok(new { Token = tokenString, UserId = user.Id });
                }
            }

            throw new UnauthorizedException($"Invalid username or password");
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Auth/GuestLogin")]
        public IActionResult GuestLogin([FromBody]Credentials credentials)
        {
            if (string.IsNullOrWhiteSpace(credentials?.Username))
                throw new BadRequestException("Username cannot be null or empty");

            var user = _context.Users.FirstOrDefault(u => u.UserName.Equals(credentials.Username, StringComparison.OrdinalIgnoreCase));
            if (user == null)
                throw new UnauthorizedException($@"No guest user was found with username ""{credentials.Username}""");

            var tokenString = GetTokenString(user, DateTime.Now.AddDays(7));
            return Ok(new { Token = tokenString, UserId = user.Id });
        }


        [HttpPost]
        [AllowAnonymous]
        [Route("Auth/Hash")]
        public IActionResult Hash([FromBody]Credentials input)
        {
            return Ok(new { Hash = _hasher.HashPassword(null, input?.Password ?? "") });
        }

        private static string GetTokenString(ApplicationUser user, DateTime expirationTime)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECURITY_KEY")));
            var signingCreds = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

            var tokenOptions = new JwtSecurityToken(
                issuer: IdentityHelpers.ValidIssuer,
                audience: IdentityHelpers.ValidAudience,
                claims: new List<Claim> { new Claim(IdentityHelpers.UserIdClaim, user.Id) },
                expires: expirationTime,
                signingCredentials: signingCreds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return tokenString;
        }
    }
}
