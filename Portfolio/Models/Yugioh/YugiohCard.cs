using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Yugioh
{
    public class YugiohCard
    {
        public YugiohCard() { }
        public int? Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Desc { get; set; }
        public int? Atk { get; set; }
        public int? Def { get; set; }
        public int? Level { get; set; }
        public string Race { get; set; }
        public string Attribute { get; set; }
        public int? Scale { get; set; }
        public int? LinkVal { get; set; }
        public List<string> LinkMarkers { get; set; }
        public IEnumerable<MiscInfo> Misc_Info { get; set; }
        public IEnumerable<CardSet> Card_Sets { get; set; }
        public IEnumerable<CardImage> Card_Images { get; set; }
        public IEnumerable<CardPrices> Card_Prices { get; set; }
        public BanlistInfo Banlist_Info { get; set; }
        public string Archetype { get; set; }
    }

    public class CardSet
    {
        public CardSet() { }
        public string Set_Name { get; set; }
        public string Set_Code { get; set; }
        public string Set_Rarity { get; set; }
        public string Set_Rarity_Code { get; set; }
        public string Set_Price { get; set; }
    }

    public class CardImage
    {
        public CardImage() { }
        public string Id { get; set; }
        public string Image_Url { get; set; }
        public string Image_Url_Small { get; set; }
    }

    public class CardPrices
    {
        public CardPrices() { }
        public decimal? Cardmarket_Price { get; set; }
        public decimal? Tcgplayer_Price { get; set; }
        public decimal? Ebay_Price { get; set; }
        public decimal? Amazon_Price { get; set; }
        public decimal? Coolstuffinc_Price { get; set; }
    }

    public class BanlistInfo
    {
        public BanlistInfo() { }
        public string Ban_Tcg { get; set; }
        public string Ban_Ocg { get; set; }
    }

    public class MiscInfo
    {
        public string? Beta_Name { get; set; }
        public bool? Question_Atk { get; set; }
        public bool? Question_Def { get; set; }
        public bool? Has_Effect { get; set; }
        public string Tcg_Date { get; set; }
        public string Ocg_Date { get; set; }
        public int? Konami_Id { get; set; }
    }
}
