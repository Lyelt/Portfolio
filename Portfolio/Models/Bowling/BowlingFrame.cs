using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Bowling
{
    public class BowlingFrame
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BowlingGameId { get; set; }

        [Required]
        public int FrameNumber { get; set; }

        [Required]
        public int Roll1Score { get; set; }

        [Required]
        public int Roll2Score { get; set; }

        public int Roll3Score { get; set; }

        public bool IsSplit { get; set; }

        // This approach is slightly flawed, because it will never
        // count pins knocked down in the third roll.
        // A more complete implementation would look at each possible
        // combination of spares and strikes in the 10th frame and
        // return a list of counts, instead of a single integer.
        public int GetCount()
        {
            if (FrameNumber == 10 && (Roll1Score == 10 || Roll2Score == 10))
                return 10;

            return Roll1Score + Roll2Score;
        }

        public bool IsSinglePinSpare()
        {
            // Normal case, 9/ or 9-
            return Roll1Score == 9
                // If we're in the 10th frame, then the score could also be X9/ or X9-
                || (FrameNumber == 10 && Roll1Score == 10 && Roll2Score == 9);
        }

        public bool IsConvertedSinglePinSpare()
        {
            return IsSinglePinSpare() &&
                // If this is the 10th, check if the spare is in the 2nd and 3rd rolls, or 1st and 2nd
                (FrameNumber == 10 && Roll1Score == 10 && Roll2Score == 9 ?
                    Roll3Score == 1 :
                    Roll2Score == 1);
        }

        public bool IsConvertedSplit()
        {
            return IsSplit &&
                (FrameNumber == 10 && Roll1Score == 10 ?
                    Roll2Score + Roll3Score == 10 :
                    Roll1Score + Roll2Score == 10);
        }

        // Also flawed, in that the tenth frame will never be counted for its
        // second and third rolls.
        public bool IsStrike()
        {
            return Roll1Score == 10;
        }

        public bool IsClear()
        {
            // Frames 1-9, it's a clear if the two rolls add up to 10
            return FrameNumber < 10 ? Roll1Score + Roll2Score == 10 :
                // Frame 10, I will count it a clear if all three rolls add up to 10.
                // It becomes a little inaccurate, because three strikes will only count as "yes, it's a clear",
                // but for the sake of percentages, I'm fine with it.
                Roll1Score + Roll2Score + Roll3Score >= 10;
        }
    }
}
