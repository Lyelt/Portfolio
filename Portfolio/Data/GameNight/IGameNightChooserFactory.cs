using Portfolio.Models.Auth;
using Portfolio.Models.GameNight;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public interface IGameNightChooserFactory
    {
        string GetNextGameNightChooserId(string previousChooserName);
    }
}
