using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Portfolio.Models.Errors
{
    public class HttpStatusException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public HttpStatusException(HttpStatusCode code, string msg) : base(msg)
        {
            StatusCode = code;
        }
    }
}
