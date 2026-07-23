using System;
using System.Net;

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
