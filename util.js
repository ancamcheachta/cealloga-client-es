const bin2string = (array) => {
	var result = "";
	for(var i = 0; i < array.length; ++i){
		result+= (String.fromCharCode(array[i]));
	}
	return result;
};

export function fetch(result) {
    return {
        isMock: () => result &&
            typeof result == 'object' && result.data && result.type == 'Buffer',
        json: () => JSON.parse(bin2string(result.data))
    };
}