
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Data;
using System;
using System.Threading.Tasks;

namespace Portfolio.Models.Dog
{
    public enum Dog
    {
        Penny,
        Calvin,
        Nobody
    }

    public record DogTime(Dog Dog, DateTime Timestamp);

    public class DogHub : Hub
    {
        private readonly IDogService _dogService;

        public DogHub(IDogService dogService)
        {
            _dogService = dogService;
        }

        public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("dogToggled", _dogService.GetOutsideDog());
        }

        public async Task ToggleDog(Dog dog)
        {
            await _dogService.Toggle(dog);
            await Clients.All.SendAsync("dogToggled", dog);
        }

        public async Task Nudge(Dog dog)
        {
            await Clients.All.SendAsync("dogNudged", dog);
        }
    }

    public class DogService : IDogService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private Dog _outsideDog = Dog.Nobody;

        public DogService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public async Task Toggle(Dog dog)
        {
            _outsideDog = dog;
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<DogContext>();
            await db.DogTimes.AddAsync(new DogTime(dog, DateTime.UtcNow));
            await db.SaveChangesAsync();
        }

        public Dog GetOutsideDog() => _outsideDog;
    }

    public interface IDogService
    {
        Task Toggle(Dog dog);

        Dog GetOutsideDog();
    }
}
