import { render, screen, fireEvent } from '@testing-library/react';

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

describe('PropertyFilters', () => {

    //test that all filter inputs appear on the page
    test('renders all filter inputs', () => {

        //render the component with a fake onSearch function
        render(<PropertyFilters onSearch={jest.fn()} />);

        //check that each filter input is displayed
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/beds/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/baths/i)).toBeInTheDocument();
    });

    //test that selected filters are sent when search is clicked
    test('calls onSearch with filter values when submitted', () => {

        //create a fake search function
        const onSearch = jest.fn();

        //render the component
        render(<PropertyFilters onSearch={onSearch} />);

        //enter a city
        fireEvent.change(screen.getByLabelText(/city/i), {
            target: { value: 'Ridgecrest' }
        });

        //enter a minimum price
        fireEvent.change(screen.getByLabelText(/min price/i), {
            target: { value: '300000' }
        });

        //click the search button
        fireEvent.click(screen.getByText('Search'));

        //check that onSearch received the correct filters
        expect(onSearch).toHaveBeenCalledWith({
            city: 'Ridgecrest',
            minPrice: '300000'
        });
    });

    //test that clear filters removes all entered values
    test('clears all filters when Clear button clicked', () => {

        //create a fake search function
        const onSearch = jest.fn();

        //render the component
        render(<PropertyFilters onSearch={onSearch} />);

        //enter a city
        fireEvent.change(screen.getByLabelText(/city/i), {
            target: { value: 'Ridgecrest' }
        });

        //click the clear filters button
        fireEvent.click(screen.getByText(/clear filters/i));

        //check that the city input is empty
        expect(screen.getByLabelText(/city/i)).toHaveValue('');

        //check that an empty filter object was sent
        expect(onSearch).toHaveBeenCalledWith({});
    });

    //test that empty filters are not included in the search
    test('removes empty filter values before submitting', () => {

        //create a fake search function
        const onSearch = jest.fn();

        //render the component
        render(<PropertyFilters onSearch={onSearch} />);

        //enter only a city and leave the other fields empty
        fireEvent.change(screen.getByLabelText(/city/i), {
            target: { value: 'Ridgecrest' }
        });

        //click the search button
        fireEvent.click(screen.getByText('Search'));

        //check that only the city was included
        expect(onSearch).toHaveBeenCalledWith({
            city: 'Ridgecrest'
        });
    });
});