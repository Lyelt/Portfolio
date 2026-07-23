namespace Portfolio.Data
{
    public interface IGameNightChooserFactory
    {
        string GetNextGameNightChooserId(string previousChooserName);
    }
}
