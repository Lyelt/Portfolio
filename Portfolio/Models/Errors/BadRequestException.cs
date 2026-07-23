using System.Net;

namespace Portfolio.Models.Errors
{
    public class BadRequestException : HttpStatusException
    {
        public BadRequestException(string msg) : base(HttpStatusCode.BadRequest, msg)
        {
        }
    }
}
