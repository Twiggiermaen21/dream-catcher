package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.EarthSign;

public final class Capricorn extends EarthSign {
    public Capricorn() { super("Capricorn", "♑", 12, 22, 1, 19); }
    @Override public Modality getModality()    { return Modality.CARDINAL; }
    @Override public String getLuckyColor()    { return "Dark Brown"; }
    @Override public String getRulingPlanet()  { return "Saturn"; }
}
