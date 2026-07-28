using System;

namespace Portfolio.Models.Errors
{
    public class ErrorResponse
    {
        public string Message { get; set; }

        public int Code { get; set; }

        public ErrorResponse(Exception ex)
        {
            if (ex is HttpStatusException httpEx)
            {
                Code = (int)httpEx.StatusCode;
                Message = ex.Message;
            }
            else
            {
                Code = 500;
                Message = "An unspecified server error occurred.";
            }
        }
    }
}
