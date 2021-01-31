using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Portfolio.Models.Errors
{
    public class BadRequestException : HttpStatusException
    {
        public BadRequestException(string msg) : base(HttpStatusCode.BadRequest, msg)
        {
        }
    }
}
