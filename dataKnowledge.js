

// YUKKY HARDCODED STUFF GOES IN HERE :-P 

// Get a list of the known table names
function GetTableNames()
{
	var list = {}
	
	if ('a' == 'b') {
		list[0] = "Partner";
	}
	else {	
	list[0] = "Individual";
	list[1] = "Business";
	list[2] = "Partner";
	list[3] = "Employee";
	list[4] = "Stock";
	list[5] = "Relation";
	list[6] = "Referral";
	list[7] = "FinancialYear";
	list[8] = "Individual_Relation";
	list[9] = "Individual_Stock";
	list[10] = "Individual_TaxRecord";
	list[11] = "Business_TaxRecord";

	}
	return list;
}


// Get the property name for a particular table that is used to describe the data
function GetDescriptionField(dataName) {
	
	switch (dataName) {
	
	case 'Referral':
		return "Type";
	case 'Business':
		return "Name";
	case 'Business_TaxRecord':
		return "BusinessId";
	case 'Employee':
		return "Name";
	case 'FinancialYear':
		return "Year";
	case 'Individual':
		return "Name";
	case 'Individual_Relation':
	case 'Individual_Stock':
	case 'Individual_TaxRecord':
		return "PersonId";
	case 'Partner':
		return "Name";
	case 'Relation':
		return "Type";
	case 'Stock':
		return "Name";
	default:
		return "Id";
	}	
}

function GetDataProperties(dataName) {
	
	var list = {}
	
	switch (dataName) {
		case 'Referral':
			list[0] = 'Id';
			list[1] = 'Type';
			list[2] = 'Value';
			return list;
		case 'Individual':
			list[0] = 'Id';	
			list[1] = 'Name';
			list[2] = 'Title';
			list[3] = 'FirstName';
			list[4] = 'LastName';
			list[5] = 'Gender';
			list[6] = 'DOB';
			list[7] = 'TFN';
			list[8] = 'Mobile';
			list[9] = 'Email';
			list[10] = 'Twitter';
			list[11] = 'Notes';
			list[12] = 'AddressLine1';
			list[13] = 'AddressLine2';
			list[14] = 'Postcode';
			list[15] = 'City';
			list[16] = 'State';
			return list;
		case 'Business':
			list[0] = 'Id';
			list[1] = 'Name';
			list[2] = 'ACN';
			list[3] = 'Phone';
			list[4] = 'Website';
			list[5] = 'AddressLine1';
			list[6] = 'AddressLine2';
			list[7] = 'Postcode';
			list[8] = 'City';
			list[9] = 'State';
			list[10] = 'Type';
			list[11] = 'Reserves';
			return list;
		case 'Employee':
			list[0] = 'Id';
			list[1] = 'Name';
			list[2] = 'Title';
			list[3] = 'FirstName';
			list[4] = 'LastName';
			list[5] = 'DOB';
			list[6] = 'Mobile';
			list[7] = 'Email';
			list[8] = 'Twitter';
			list[9] = 'Notes';
			list[10] = 'AddressLine1';
			list[11] = 'AddressLine2';
			list[12] = 'Postcode';
			list[13] = 'City';
			list[14] = 'State';
			list[15] = 'Income';
			return list;
		case 'Partner':
			list[0] = 'Id';
			list[1] = 'Name';			
			list[2] = 'Title';
			list[3] = 'FirstName';
			list[4] = 'LastName';
			list[5] = 'DOB';
			list[6] = 'Mobile';
			list[7] = 'Email';
			list[8] = 'Twitter';
			list[9] = 'Notes';
			list[10] = 'AddressLine1';
			list[11] = 'AddressLine2';
			list[12] = 'Postcode';
			list[13] = 'City';
			list[14] = 'State';
			list[15] = 'Income';
			return list;
			
		default:
			return list;
	}
		
}

function GetFieldType(field) {
	
	switch (field) {
	case 'Quantity':
		return 'int';
	case 'Reserves':
	case 'Revenue':
	case 'TaxPayable':
	case 'Income':
	case 'BaseValue':
	case 'Total':
		return 'money';	
	case 'DOB':
		return 'date';	
	case 'Mobile':
	case 'Phone':
		return 'phone';
	default:
		return 'string';
	}
}



function GetBrowsableTables() {
	var list = {}

	list[0] = "Individual";
	list[1] = "Business";
	list[2] = "Employee";
	list[3] = "Partner";
	
	return list;
	
	
}



exports.GetDescriptionField = GetDescriptionField;
exports.GetTableNames = GetTableNames;
exports.GetDataProperties = GetDataProperties;
exports.GetBrowsableTables = GetBrowsableTables;
exports.GetFieldType = GetFieldType;


