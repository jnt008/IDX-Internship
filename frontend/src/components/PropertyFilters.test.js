import { render, screen } from '@testing-library/react';

// import the function we want to test
import PropertyFilters from './PropertyFilters';

//empty function 
const mockSearch = () => {};

//test the rendering of all 6 property fields
test('renders all 6 input filters', () => {
    render(<PropertyFilters onSearch={mockSearch}/>);

    const cityInput = screen.getByLabelText("City");
    expect(cityInput).toBeInTheDocument();

    const zipInput = screen.getByLabelText("ZIP Code");
    expect(zipInput).toBeInTheDocument();

    const minPriceInput = screen.getByLabelText("Min Price");
    expect(minPriceInput).toBeInTheDocument();

    const maxPriceInput = screen.getByLabelText("Max Price");
    expect(maxPriceInput).toBeInTheDocument();

    const bedsInput = screen.getByLabelText("Beds");
    expect(bedsInput).toBeInTheDocument();

    const bathsInput = screen.getByLabelText("Baths");
    expect(bathsInput).toBeInTheDocument();
});