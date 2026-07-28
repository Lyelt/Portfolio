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
        private const string GuestUserName = "Guest";

        private readonly PortfolioContext _context;
        private readonly IPasswordHasher<ApplicationUser> _hasher;
        private readonly ILogger<AuthController> _logger;
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(
            PortfolioContext context,
            IPasswordHasher<ApplicationUser> hasher,
            ILogger<AuthController> logger,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _hasher = hasher;
            _logger = logger;
            _userManager = userManager;
        }


        [HttpPost]
        [AllowAnonymous]
        [Route("Auth/Login")]
        public IActionResult Login([FromBody] Credentials credentials)
        {
            if (string.IsNullOrWhiteSpace(credentials?.Username) || string.IsNullOrWhiteSpace(credentials?.Password))
                throw new BadRequestException("Username and password cannot be null or empty");

            var user = _context.Users.FirstOrDefault(u => u.UserName.Equals(credentials.Username));

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
        public async Task<IActionResult> GuestLogin()
        {
            var user = await _userManager.FindByNameAsync(GuestUserName);
            if (user == null ||
                !string.Equals(user.UserName, GuestUserName, StringComparison.Ordinal) ||
                await _userManager.IsLockedOutAsync(user))
            {
                return RejectGuestLogin();
            }

            var roles = await _userManager.GetRolesAsync(user);
            var guestRole = ApplicationRole.Guest.ToString();
            if (roles.Count != 1 || !string.Equals(roles[0], guestRole, StringComparison.Ordinal))
                return RejectGuestLogin();

            var tokenString = GetTokenString(user, DateTime.UtcNow.AddDays(7));
            return Ok(new { Token = tokenString, UserId = user.Id });
        }

        private IActionResult RejectGuestLogin()
        {
            _logger.LogWarning("Guest login refused because the dedicated guest identity is unavailable or misconfigured.");
            throw new UnauthorizedException("Guest login is unavailable");
        }


        private static string GetTokenString(ApplicationUser user, DateTime expirationTime)
        {
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(IdentityHelpers.JwtSecurityKey));
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
