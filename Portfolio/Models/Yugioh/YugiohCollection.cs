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

        public void PopulateCards(IEnumerable<YugiohCard> allCards)
        {
            Cards = allCards
                .Join(CardIds,
                    ygoCard => ygoCard.Id, 
                    cardId => cardId.Id, 
                    (ygoCard, cardId) => ygoCard)
                .ToList();
        }
    }

    public class Card
    {
        [Key]
        public int Id { get; set; }

        public string SetCode { get; set; }

        public CardCollection CardCollection { get; set; }
    }
}
