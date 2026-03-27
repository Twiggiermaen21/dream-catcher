package com.dreamcatcher.domain.astrology;

public abstract class FireSign extends ZodiacSign {

    protected FireSign(String name, String symbol,
                       int startMonth, int startDay,
                       int endMonth, int endDay) {
        super(name, symbol, startMonth, startDay, endMonth, endDay);
    }

    @Override
    public Element getElement() { return Element.FIRE; }

    @Override
    public String getSleepInsight() {
        return "Znaki ognia mają tendencję do nadmiernie aktywnego umysłu przed snem. " +
               "Zalecane: wyciszające rytuały wieczorne, unikanie intensywnego wysiłku po 20:00.";
    }
}
