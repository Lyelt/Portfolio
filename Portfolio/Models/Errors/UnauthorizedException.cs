using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Portfolio.Models.Errors
{
    public class UnauthorizedException : HttpStatusException
    {
        public UnauthorizedException(string msg) : base(HttpStatusCode.Unauthorized, msg)
        {
        }
    }
}
