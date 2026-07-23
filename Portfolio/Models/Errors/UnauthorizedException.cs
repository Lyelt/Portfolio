using System.Net;

namespace Portfolio.Models.Errors
{
    public class UnauthorizedException : HttpStatusException
    {
        public UnauthorizedException(string msg) : base(HttpStatusCode.Unauthorized, msg)
        {
        }
    }
}
