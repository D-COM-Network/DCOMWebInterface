/*
Copyright (C) 2022 Cardiff University

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

export default function setPathVariables(Vue) {
	

	Vue.prototype.$complianceDocumentService = 'https://regulations.dcom.org.uk/';
	Vue.prototype.$ruleEngine = 'https://engine.dcom.org.uk/';
	Vue.prototype.$serviceLookup = 'https://lookup.dcom.org.uk/';
	Vue.prototype.$solibri = 'https://interface.dcom.org.uk/solibri/';

}