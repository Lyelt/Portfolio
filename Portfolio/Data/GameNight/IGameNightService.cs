using Portfolio.Models.GameNight;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public interface IGameNightService
    {
        Task<IEnumerable<GameNight>> GetGameNights(DateTimeOffset startDate, int numberOfGameNights);

        Task SkipGameNight(int gameNightId);

        Task CancelGameNight(int gameNightId);

        Task UncancelGameNight(int gameNightId);
    }
}
