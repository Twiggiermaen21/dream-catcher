package com.dreamcatcher.domain.astrology;

public abstract class AirSign extends ZodiacSign {

    protected AirSign(String name, String symbol,
                      int startMonth, int startDay,
                      int endMonth, int endDay) {
        super(name, symbol, startMonth, startDay, endMonth, endDay);
    }

    @Override
    public Element getElement() { return Element.AIR; }

    @Override
    public String getSleepInsight() {
        return "Znaki powietrza mają aktywny umysł analityczny — trudno im 'wyłączyć' myśli. " +
               "Journaling przed snem pomaga przetworzyć myśli i skrócić czas zasypiania.";
    }
}
