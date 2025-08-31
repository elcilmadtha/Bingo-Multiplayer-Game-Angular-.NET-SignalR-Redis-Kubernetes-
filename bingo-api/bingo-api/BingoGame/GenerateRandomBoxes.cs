namespace bingo_api.BingoGame
{
    public static class GenerateRandomBoxes
    {
        public static Bingo GenerateRandomBoard(string sessionId, string username)
        {
            List<int> numbers = Enumerable.Range(1, 25).ToList();
            Random rand = new Random();
            for (int i = numbers.Count - 1; i > 0; i--)
            {
                int j = rand.Next(i + 1);
                int temp = numbers[i];
                numbers[i] = numbers[j];
                numbers[j] = temp;
            }

            Bingo bingos = new Bingo();
            bingos.SessionId = sessionId;
            bingos.UserName =   username;
            bingos.Cell = numbers;

            return bingos;
        }
    }
}
