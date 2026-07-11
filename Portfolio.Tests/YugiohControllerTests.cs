using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Portfolio.Controllers;
using Portfolio.Data;
using Portfolio.Models.Yugioh;

namespace Portfolio.Tests;

public sealed class YugiohControllerTests
{
    [Fact]
    public async Task FilteringAndPaginationReturnTheExpectedPageAndTotal()
    {
        var catalog = new StubCatalog(new List<YugiohCard>
        {
            new YugiohCard { Id = 1, Name = "Alpha One" },
            new YugiohCard { Id = 2, Name = "Beta" },
            new YugiohCard { Id = 3, Name = "Alpha Two" }
        });
        var controller = new YugiohController(
            null,
            null,
            NullLogger<YugiohController>.Instance,
            catalog,
            null);
        var filter = new YugiohCardFilter
        {
            PageNumber = 2,
            Count = 1,
            Filters = new List<PropertyFilter>
            {
                new PropertyFilter { Name = "NAME", Value = "alpha" }
            }
        };

        var action = await controller.GetCardsWithFilter(filter, CancellationToken.None);
        var result = Assert.IsType<OkObjectResult>(action);
        var searchResults = Assert.IsType<SearchResults>(result.Value);

        Assert.Equal(2, searchResults.TotalResults);
        Assert.Equal(3, Assert.Single(searchResults.Results).Id);
    }

    [Fact]
    public async Task RouteFilterIsAppliedBeforePagination()
    {
        var catalog = new StubCatalog(new List<YugiohCard>
        {
            new YugiohCard { Id = 1, Name = "Blue-Eyes White Dragon" },
            new YugiohCard { Id = 2, Name = "Dark Magician" }
        });
        var controller = new YugiohController(
            null,
            null,
            NullLogger<YugiohController>.Instance,
            catalog,
            null);

        var action = await controller.GetCards(1, 20, "dragon", CancellationToken.None);
        var result = Assert.IsType<OkObjectResult>(action);
        var cards = Assert.IsType<List<YugiohCard>>(result.Value);

        Assert.Equal(1, Assert.Single(cards).Id);
    }

    private sealed class StubCatalog : IYugiohCardCatalog
    {
        private readonly IReadOnlyList<YugiohCard> _cards;

        public StubCatalog(IReadOnlyList<YugiohCard> cards)
        {
            _cards = cards;
        }

        public Task<IReadOnlyList<YugiohCard>> GetCardsAsync(CancellationToken cancellationToken) =>
            Task.FromResult(_cards);
    }
}
