namespace bingo_api.BingoGame
{
    public class Bingo
    {
        public string SessionId {  get; set; }
        public string UserName {  get; set; }
        public List<int> Cell { get; set; }
        public Boolean EnabledToPlay { get; set; } = false;
        public List<string> Opponents { get; set; }
    }
}
