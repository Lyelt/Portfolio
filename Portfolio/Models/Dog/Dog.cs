
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Portfolio.Models.Dog
{
    public enum Dog
    {
        Penny,
        Calvin,
        Nobody
    }

    public class DogHub : Hub
    {
        private readonly IDogService _dogService;

        public DogHub(IDogService dogService)
        {
            _dogService = dogService;
        }

        public async Task ToggleDog(Dog dog)
        {
            _dogService.Toggle(dog);
            await Clients.All.SendAsync("dogToggled", dog);
        }

        public async Task Nudge(Dog dog)
        {
            await Clients.All.SendAsync("dogNudged", dog);
        }
    }

    public class DogService : IDogService
    {
        private Dog _outsideDog = Dog.Nobody;

        public void Toggle(Dog dog)
        {
            _outsideDog = dog;
        }

        public Dog GetOutsideDog() => _outsideDog;
    }

    public interface IDogService
    {
        void Toggle(Dog dog);

        Dog GetOutsideDog();
    }
}
