using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Auth
{
    public class ApplicationUser : IdentityUser
    {
        public override bool Equals(object obj)
        {
            return obj is ApplicationUser u && u.Id == Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }

        public ClientUser AsClientUser() => new ClientUser { Id = Id, UserName = UserName };
    }

    public class ClientUser : ApplicationUser
    {

    }
}
