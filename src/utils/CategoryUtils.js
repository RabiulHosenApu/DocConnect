export const filterServicesByCategory = (category, doctorData) => {
    if (category === "") {
        return doctorData;
    } else {
        const filteredList = doctorData.filter((doctor) =>
            doctor.department.toLowerCase() === category.toLowerCase()
        );
        return filteredList;
    }
};
