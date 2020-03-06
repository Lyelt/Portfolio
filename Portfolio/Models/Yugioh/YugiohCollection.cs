using Newtonsoft.Json;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Yugioh
{
    public class CardCollection
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        [JsonIgnore]
        public ApplicationUser User { get; set; }

        [Required]
        public string Name { get; set; }

        public List<Card> CardIds { get; set; }

        [NotMapped]
        public List<YugiohCard> Cards { get; set; }

        [NotMapped]
        public List<string> Sections { get; set; }

        public void PopulateCards(IEnumerable<YugiohCard> allCards)
        {
            Cards = allCards
                .Join(CardIds,
                    ygoCard => ygoCard.Id, 
                    cardId => cardId.Id, 
                    (ygoCard, cardId) => ygoCard)
                .ToList();

            Sections = CardIds.Select(c => c.Section).Distinct().ToList();
        }
    }

    public class Card
    {
        public int Id { get; set; }

        public string Section { get; set; }

        public string SetCode { get; set; }

        public int Quantity { get; set; }

        public CardCollection CardCollection { get; set; }

        public int CardCollectionId { get; set; }
    }
}
