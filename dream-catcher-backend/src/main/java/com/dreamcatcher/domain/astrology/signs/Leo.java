package com.dreamcatcher.domain.astrology.signs;

import com.dreamcatcher.domain.astrology.FireSign;

public final class Leo extends FireSign {
    public Leo() { super("Leo", "♌", 7, 23, 8, 22); }
    @Override public Modality getModality()    { return Modality.FIXED; }
    @Override public String getLuckyColor()    { return "Gold"; }
    @Override public String getRulingPlanet()  { return "Sun"; }
}
