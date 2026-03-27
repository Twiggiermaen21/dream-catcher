package com.dreamcatcher.domain.astrology;

public abstract class EarthSign extends ZodiacSign {

    protected EarthSign(String name, String symbol,
                        int startMonth, int startDay,
                        int endMonth, int endDay) {
        super(name, symbol, startMonth, startDay, endMonth, endDay);
    }

    @Override
    public Element getElement() { return Element.EARTH; }

    @Override
    public String getSleepInsight() {
        return "Znaki ziemi śpią najlepiej przy regularnym harmonogramie. " +
               "Nieregularne godziny snu mocno obniżają ich jakość wypoczynku.";
    }
}
